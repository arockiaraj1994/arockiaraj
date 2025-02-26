# API Reference

This page provides detailed documentation for the API endpoints available in this project.

## Authentication

All API requests require authentication using an API key.

```bash
curl -H "Authorization: Bearer YOUR_API_KEY" https://api.example.com/v1/resource
```

## Endpoints

### GET /api/v1/resources

Returns a list of all resources.

**Parameters**:

| Name | Type | Description |
|------|------|-------------|
| limit | integer | Maximum number of resources to return |
| offset | integer | Number of resources to skip |

**Example Response**:

```json
{
  "data": [
    {
      "id": "1",
      "name": "Example Resource",
      "created_at": "2024-01-01T12:00:00Z"
    }
  ],
  "meta": {
    "total": 100,
    "limit": 10,
    "offset": 0
  }
}
```

### POST /api/v1/resources

Creates a new resource.

**Request Body**:

```json
{
  "name": "New Resource",
  "description": "A description of the resource"
}
```

**Example Response**:

```json
{
  "id": "2",
  "name": "New Resource",
  "description": "A description of the resource",
  "created_at": "2024-05-20T14:30:00Z"
}
```