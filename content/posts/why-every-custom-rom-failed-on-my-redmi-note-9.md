---
title: "Why Every Custom ROM Failed on My Redmi Note 9"
date: 2026-08-21T00:00:00+05:30
lastmod: 2026-08-21T00:00:00+05:30
categories: ["Android"]
tags: ["Android", "Custom ROM", "Xiaomi", "MediaTek", "Debugging", "adb"]
author: "Arockiaraj"
description: "Two sessions, three wrong theories, and the one property that explained every failure"
draft: false
---

I wanted a cheap Android phone for app testing. Not an emulator, a real one: real thermals, a real camera, real sensors, and a real low-end CPU that shows you what your app feels like for people who aren't on flagships. I had exactly the right device sitting in a drawer, a Redmi Note 9 with a MediaTek Helio G85 and 4 GB of RAM.

One problem. MIUI. Aggressive background killing that murders your services and alarms, so any behaviour you observe is MIUI's behaviour, not Android's. I needed a clean AOSP-style ROM on it.

It took me two sessions to get there. The first one failed completely. The second one worked in a few hours, and the reason the first one failed turned out to be something neither I nor Claude was looking at.

## Act 1: The session where nothing worked

The first attempt went the way these things usually go. Unlock the bootloader, flash a custom recovery, sideload a ROM. Three steps.

I never got past step two.

I flashed SHRP. `fastboot` said `OKAY`. I rebooted, and the phone came up in MIUI. I flashed OrangeFox. `OKAY` again. Rebooted, MIUI again. I tried holding Volume Up on boot and landed in **MIUI Recovery 5.0**, the stock one, offering me exactly four options: Reboot, Wipe Data, Connect with Mi Assistant, Safe Mode. Not my recovery. Never my recovery.

I tried postmarketOS. Nothing on screen.

I chased every theory the internet offers for this. Wrong recovery build. Flash it again. Don't let it boot to system. Try a different key combo. Try a different USB port. Every single time: flash succeeds, phone boots MIUI, recovery gone.

Eventually I gave up on the ROM entirely and spent the rest of that session doing the consolation prize: uninstalling MIUI bloatware over adb. Swapped SwiftKey for Gboard, removed MiPay, killed FM Radio, dropped GetApps. Useful, but not what I came for. The session ended with me typing:

> "I really cannot understand why not able to install custom rom."

That frustration is the honest starting point for everything below.

## Act 2: Two confident theories, both wrong

When I picked this up again in a fresh session, I mentioned something I'd forgotten to say the first time: **Ubuntu Touch had installed on this phone successfully, once, a while back.**

That produced a very tidy theory. Ubuntu Touch on this device is a Halium port. It repurposes the recovery partition and leaves a partition layout no Android recovery expects. So of course TWRP flashes `OKAY` and can't run: it's being written into a slot that isn't shaped like a recovery partition anymore.

Tidy. Plausible. Completely wrong.

Two `getprop` values killed it:

```
ro.build.version.incremental        = V13.0.5.0.SJOINXM
ro.vendor.build.version.incremental = V13.0.5.0.SJOINXM
```

System and vendor match exactly. That's a coherent, complete stock install, not the wreckage of a Halium port. Whatever Ubuntu Touch had done, it had already been fully overwritten.

Theory two: MIUI restores stock recovery on every boot. This is real behaviour, well documented, and it fits the symptom perfectly, flash recovery, boot once, recovery is gone. The restore is done by a script on the system partition. So:

```
ls: /system/recovery-from-boot.p: No such file or directory
ls: /system/bin/install-recovery.sh: No such file or directory
```

Neither exists. Nothing was restoring anything.

Two good theories, both dead, and both killed in under a minute by a command that costs nothing to run. That's the actual lesson of this whole saga, and I'll come back to it.

## Act 3: The property that explained everything

Here's the value that mattered, sitting in the same dump the whole time:

```
ro.build.version.release = 12
```

Android 12. And from the LineageOS installation page for this device:

> "Your device needs a specific firmware version before proceeding… **The required version is Android 11**… Failing to install the correct firmware version prior to installation may result in failure to install LineageOS, unexpected crashes post-installation, **or permanent damage to your device!**"

Every custom ROM for this phone, and every custom recovery, is built against the **Android 11** vendor blob. I was on Android 12.

That's it. That's the whole thing.

An Android 11 recovery ramdisk on an Android 12 vendor either won't boot at all or boots and can't read `/data`, because Android 12 changed the file-based-encryption policy version. My flashes were all succeeding. The images were landing on the partition correctly every single time. They just couldn't *run* on the vendor underneath them.

I'd spent a whole session debugging the recovery. The recovery was never the problem.

Two details that would have saved me hours if I'd known them:

**Read the build code letter.** Xiaomi build names encode the Android version in one character. `Q` = 10, `R` = 11, `S` = 12, `T` = 13. So `V13.0.5.0.**S**JOINXM` is Android 12, and the thing I actually needed was an `**R**JOINXM` build. You can tell whether a firmware is right for your ROM by looking at one letter in the filename.

**This device has two names.** LineageOS calls it `merlinx`, not `merlin`. I'd been searching the wrong codename. And when I queried their build API directly:

```
GET download.lineageos.org/api/v2/devices/merlinx/builds → []
```

Empty. There are no prebuilt LineageOS images for this phone at all, it's source-build-only. More time that could have been saved by one query.

## The anti-rollback scare

Fixing this meant downgrading firmware from Android 12 back to Android 11. On Xiaomi devices that raises anti-rollback, which is the one failure mode here that isn't recoverable. Trip it and the preloader refuses to boot. Not a bootloop. A dead phone.

```
(bootloader) anti: 2
(bootloader) fuse: yes
```

Non-zero. Stop everything.

The forums were reassuring in the way forums always are: anti-rollback was "only ever relevant for older devices," people had downgraded this model "with no issues." That's consensus, not evidence, and consensus isn't worth a phone.

So instead of trusting it, I read the number out of the firmware package itself. Xiaomi's own flasher carries its rollback index and gates on it:

```sh
CURRENT_ANTI_VER=2
version=`fastboot getvar rollback_ver ...`
if [ ${version} -gt ${CURRENT_ANTI_VER} ]; then echo "error"; exit 1; fi
```

Note what it actually checks: **`rollback_ver`**, not `anti`. On MediaTek those are different variables, and the scary `anti: 2` I'd been staring at wasn't even the one that governs the decision. Asking the device for the right one:

```
rollback_ver: 2
```

Device 2, package 2. The guard is `2 -gt 2`, which is false. Safe, provably, before touching anything.

That took about ninety seconds and turned an irreversible gamble into a verified fact. When the downside is a dead device, read the number.

The downgrade itself then just worked: `./flash_all.sh` from the MIUI 12.5.6 `RJOINXM` package. Notably **not** `flash_all_lock.sh`, which relocks the bootloader and would have put me back at the start with another unlock wait.

```
ro.build.version.release             = 11
ro.vendor.build.version.incremental  = V12.5.6.0.RJOINXM
ro.boot.flash.locked                 = 0
```

Android 11 vendor, bootloader still unlocked. For the first time, the phone was in a state where a custom recovery could actually run.

## The recovery that booted and drew nothing

OrangeFox flashed and booted. adb saw it as `recovery`. And the screen showed the OrangeFox logo and no buttons at all.

Not a failed flash. The log ended here:

```
I:File Based Encryption is present
Attempting to initialize DE keys
```

The recovery was alive and hung trying to initialise MIUI's encryption keys. It had loaded the splash page and stalled before drawing the menu.

Which is a lovely catch-22: the fix is Format Data, and Format Data is a button in the UI that can't finish loading.

## The part where I broke it myself

adb still worked, so the encryption could be cleared from the shell instead. I formatted the userdata partition directly with `mke2fs`, verified `/data` was empty, sideloaded the ROM, flashed Magisk. All clean, all reported success.

It booted straight back into recovery.

The kernel log told me it wasn't a boot failure at all:

```
[ 5.62] reboot: Restarting system with command 'recovery'
```

Five and a half seconds of completely normal boot, then userspace *chose* to reboot into recovery. And the last logcat said why:

```
vold: Failed to mkdir(/data/misc/vold/user_keys): No such file or directory
keystore2: unable to open database: /data/misc/keystore/persistent.sqlite
keystore2: panicked at 'Failed to open database.'
vold: Communication with Keystore earlyBootEnded failed error: -129
```

My raw `mke2fs` had produced a technically valid ext4 volume that Android's `vold` could not initialise. It couldn't create its key directories, `keystore2` aborted, and init gave up and bounced to recovery.

I'd fixed the FBE hang by hand and introduced a new failure in the process. The correct fix was the recovery's own Format Data, which by then worked, because clearing the encryption had let the UI finish loading. It reformats `/metadata` too, and it prints something you should read:

> "OrangeFox won't recreate `/data/media` on FBE devices. Reboot into the ROM to create it."

Which is exactly the step that had been failing. One reboot later, the setup wizard.

```
ro.superior.version  = SuperiorOS-Fourteen-merlinx-GAPPS-RELEASE-20240118-1445
ro.build.version.sdk = 34
```

Android 14, API 34, on a phone that four hours earlier wouldn't hold a recovery image for a single boot.

## The procedure that actually works

Consolidated, for this device or any MediaTek Xiaomi with the same shape of problem.

**Phase 0, before anything.** Confirm what you're actually on. This is the step whose absence cost me an entire session:

```bash
adb shell getprop ro.build.version.release
adb shell getprop ro.vendor.build.version.incremental
adb shell getprop ro.boot.flash.locked        # 0 = unlocked
```

The **vendor** line is the one that matters. That's the blob your ROM binds against.

**Phase 1, check the destructive number.** From fastboot, before any firmware flash:

```bash
fastboot getvar rollback_ver
```

Compare it against `CURRENT_ANTI_VER` inside the target package's `flash_all.sh`. Device value greater than package value means stop. Equal or lower is safe.

**Phase 2, get onto the right base.** Download the **fastboot** ROM, the `_images_` `.tgz`, not the recovery `.zip`, matching the Android version your ROM requires. Check the letter in the build name.

```bash
./flash_all.sh        # never flash_all_lock.sh
```

Then verify you landed where you intended, don't assume. Boot the stock OS once, re-enable USB debugging, and make one call and send one SMS. That provisions IMS; skip it and VoLTE can break permanently on the custom ROM.

**Phase 3, recovery.** Flash it and boot straight into it without letting the system start:

```bash
fastboot flash recovery recovery.img
fastboot reboot recovery
```

**Phase 4, wipe properly.** Format Data **from the recovery's own menu**. Not `mke2fs`, not a hand-rolled equivalent. This removes encryption and produces a `/data` that Android will actually initialise.

**Phase 5, install.** Sideload or install the ROM zip, then Magisk if you want root, then reboot. First boot takes 5 to 15 minutes.

And the pre-flight check I now run on any ROM zip before flashing it, which reads the same metadata that would have exposed my entire problem on day one:

```bash
unzip -p <rom.zip> META-INF/com/android/metadata | grep -E "pre-device|post-build|post-sdk-level"
```

You want `pre-device` to contain your codename and `post-build` to show the Android version your firmware is on. Mine reads:

```
pre-device     = merlin,merlinx,merlin_eea,merlinnfc
post-build     = Redmi/merlin/merlin:11/RP1A.200720.011/...
post-sdk-level = 34
```

`:11/` is the vendor base it needs. `34` is the Android it gives you. Those being different numbers is the entire thing I didn't understand.

## What I'd tell myself two sessions ago

**The loudest symptom was not the cause.** Every visible failure was in the recovery, so I debugged the recovery, over and over. The recovery was fine. It was running on a vendor blob it couldn't work with. When you're on attempt number six of fixing the thing that looks broken, the thing that looks broken probably isn't.

**Check the boring state first.** Four `getprop` calls at the start would have found this before I flashed anything. I skipped them because I "knew" what was on the phone.

**Plausible is not verified.** Two well-reasoned theories that fit every symptom died instantly to a one-second command. Cheap evidence beats good reasoning, and you should reach for it first, not after.

**Read the number when the downside is permanent.** Anti-rollback was the one step that could have killed the phone outright. The forums said it was fine. The package said it was fine, and the package was checkable.

**Don't hand-roll what the tool already does.** My `mke2fs` shortcut cost more time than the problem it solved. Format Data existed; I just had to clear the thing blocking it first.

The phone now runs Android 14 with root, and swapping to a different ROM is a fifteen-minute loop instead of a two-day ordeal: boot recovery, format data, flash zip, reboot. Everything expensive was one-time. I just paid for it in the wrong order.
