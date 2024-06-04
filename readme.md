# pkg-porter

A custom proxy server for private NPM registries with caching and logging capabilities, serving as an alternative to unpkg and jsdelivr.

## Table of Contents

- [Features](#features)
- [Why Use This?](#why-use-this)
  - [Benefits](#benefits)
  - [Use Cases](#use-cases)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [Logging](#logging)
- [Database](#database)
- [Environment Variables](#environment-variables)
- [Legal Disclaimer](#legal-disclaimer)

## Features

- Proxy access to packages in private NPM registries
- Caching of package contents for improved performance
- Optional logging of package access
- Environment file setup for registry credentials
- Configurable database usage
- Customizable caching and logging options

## Why Use This?

### Benefits

- **Self-Hosted Solution**: Host your own proxy server for accessing private NPM packages, ensuring control and security.
- **Performance**: Caches package contents locally to reduce latency and improve load times for subsequent requests.
- **Logging**: Logs package accesses to a database, providing insights into package usage.
- **Flexibility**: Configure caching, logging, and database usage according to your needs.

### Use Cases

- **Enterprise Applications**: Securely access private packages within your organization's network.
- **Development Environments**: Facilitate faster package retrieval and development workflows.
- **Continuous Integration**: Integrate with CI/CD pipelines to ensure reliable package access.

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Private NPM registry credentials (e.g., Azure Artifacts, Nexus, Artifactory, etc.)

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/muratpolatozkan/pkg-porter.git
   cd pkg-porter
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

## Configuration

1. Create a `.env` file in the project root and add your configuration settings:

   ```env
   # Registry URL and credentials
   REGISTRY_URL=https://your-registry-url
   USERNAME=your-username
   PASSWORD=your-password

   # Cache settings
   USE_CACHE=true

   # Server settings
   URL=http://localhost
   PORT=8081

   # Database usage (set to true if you want to use the database)
   USE_DB=true

   # Logger usage (set to true if you want to enable logging)
   USE_LOGGER=true
   ```

2. Ensure the necessary directories for logs and database are created:

   ```bash
   mkdir logs
   mkdir db
   ```

## Usage

Start the server:

```bash
npm start
```

The server will start running at the URL and port specified in your `.env` file. You can now access your private NPM packages via this proxy server.

## Logging

If logging is enabled (`USE_LOGGER=true`), logs will be saved in the `logs` directory. Each log file is named according to the date to help you keep track of access over time.

## Database

If database usage is enabled (`USE_DB=true`), an SQLite database named `access_log.db` will be created in the `db` directory. This database logs access to the packages, providing valuable insights into package usage.

## Environment Variables

The following environment variables are used to configure the proxy server:

- `REGISTRY_URL`: The URL of your private NPM registry.
- `USERNAME`: The username for your private NPM registry.
- `PASSWORD`: The password for your private NPM registry.
- `USE_CACHE`: Enable or disable caching (true/false).
- `URL`: The URL where the proxy server will be accessible.
- `PORT`: The port on which the proxy server will run.
- `USE_DB`: Enable or disable database logging (true/false).
- `USE_LOGGER`: Enable or disable file logging (true/false).

## Legal Disclaimer

This project is not affiliated with npm, Inc., unpkg, or jsdelivr in any way. It is an independent project designed to provide a custom proxy server for private NPM registries.

Any issues or problems related to the npm registry itself should be directed to npm, Inc. We are not responsible for any issues arising from the use of the npm registry or any third-party services.

By using this project, you agree that you use it at your own risk and that the author is not liable for any damages or issues that may arise from its use.

## Contributing

If you'd like to contribute to this project, please fork the repository and use a feature branch. Pull requests are welcome.

## License

This project is licensed under the MIT License. See the LICENSE file for more details.