## Examples

This folder contains several different examples of using the plugin:

- The `profiles.js` file - an example of using profiles in conjunction with a plugin.
- The `parallel.js` file - an example of running multiple browsers at the same time and extracting different data from the site.
- The `proxy.js` file - an example of launching a browser with a proxy and additional settings installed, getting an external **IP**.
- The `stealth.js` file - checking the fingerprint replacement on a site that has an anti-bot system, getting a screenshot with the results.
- The `multiple.js` file - launching several browsers sequentially with different fingerprints, collect some data about the headers and the viewport size.

To run them, clone the repository locally and install the dependencies.

## Configuration

You can configure the fingerprint service key and proxy directly in the code, or through environment variables:

```shell
FINGERPRINT_KEY="SERVICE_KEY"
FINGERPRINT_PROXY="socks5://127.0.0.1:9762"
```

Environment variables can be set directly or using the `.env` file.
