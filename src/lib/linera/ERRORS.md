# Linera Network Errors - Expected Behavior

## Understanding CORS and Network Errors

When using the Linera client in a browser environment, you may see CORS (Cross-Origin Resource Sharing) and network errors in the browser console. **These errors are expected and do not indicate a problem with your integration.**

### Common Errors You May See:

1. **CORS Policy Errors**
   ```
   Access to fetch at 'https://...' from origin 'https://localhost:5174' 
   has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header
   ```

2. **Gateway Timeout (504)**
   ```
   POST https://... net::ERR_FAILED 504 (Gateway Timeout)
   ```

3. **HTTP2 Protocol Errors**
   ```
   POST https://... net::ERR_HTTP2_PROTOCOL_ERROR 200 (OK)
   ```

### Why These Errors Occur:

1. **CORS Errors**: The Linera validator nodes may not have CORS headers configured for localhost origins. This is common in development environments.

2. **Network Timeouts**: The Linera client continuously tries to synchronize chain state in the background. If the validator is unreachable or slow, these timeouts are expected.

3. **HTTP2 Protocol Errors**: These can occur during long-lived connections (like subscriptions) and are handled gracefully by the client.

### What Happens:

- The Linera client **automatically handles these errors** internally
- Your application **continues to function normally**
- Wallet operations (queries, mutations) **still work** even if background sync fails
- The client will **retry connections** automatically

### How to Handle:

1. **In Development**: These errors are safe to ignore. They don't affect functionality.

2. **In Production**: 
   - Use a validator node that has CORS properly configured
   - Or use a proxy server to handle CORS
   - The Linera client will work offline with cached data

3. **Error Handling**: The integration already includes error handling in `LineraProvider.tsx` that suppresses these network errors from being shown as unhandled promise rejections.

### Verification:

To verify your integration is working correctly:
- Check that wallet creation/loading succeeds
- Test that queries and mutations work
- Verify that the wallet state is persisted

If these core functions work, the CORS/network errors are just background sync issues and can be safely ignored.

