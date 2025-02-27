# Configuration

After installation, you'll need to configure the project for your specific needs.

## Basic Configuration

Create a configuration file named `config.yaml` in your project root directory:

```yaml
# Basic configuration
app_name: MyApp
debug: false
log_level: info

# Database settings
database:
  host: localhost
  port: 5432
  name: mydb
  user: user
  password: password
```

## Environment Variables

You can also use environment variables to override configuration settings:

```bash
export APP_DEBUG=true
export APP_LOG_LEVEL=debug
```

## Advanced Options

For advanced configuration options, please refer to the [Advanced Usage](../user-guide/advanced-usage.md) section.