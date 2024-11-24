export const fetchWithAuthRetry = async (url: string, options: RequestInit = {}): Promise<Response> => {
    const accessToken = localStorage.getItem("accessToken");
  
    // Add Authorization header if access token exists
    if (accessToken) {
      options.headers = {
        ...options.headers,
        Authorization: `Bearer ${accessToken}`,
      };
    }
  
    const response = await fetch(url, options);
  
    if (response.status === 401) {
      console.warn("Access token expired. Attempting to refresh...");
  
      // Try refreshing the access token
      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) {
        console.error("Refresh token not found. User needs to log in again.");
        return response;
      }
  
      try {
        const refreshResponse = await fetch("/api/users/refresh", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken }),
        });
  
        if (refreshResponse.ok) {
          const data = await refreshResponse.json();
          if (data.accessToken) {
            console.log("Access token refreshed successfully.");
  
            // Update the access token in localStorage
            localStorage.setItem("accessToken", data.accessToken);
  
            // Retry the original request with the new access token
            const retryOptions = {
              ...options,
              headers: {
                ...options.headers,
                Authorization: `Bearer ${data.accessToken}`,
              },
            };
            return await fetch(url, retryOptions);
          }
        } else {
          console.error("Failed to refresh access token. User needs to log in again.");
        }
      } catch (error) {
        console.error("Error refreshing access token:", error);
      }
    }
  
    return response; // Return the original response (401 or otherwise)
  };
  