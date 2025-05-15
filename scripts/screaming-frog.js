const API_BASE_URL = "https://api.indexinginsight.com"
const API_KEY = "INSERT_HERE_YOUR_API_KEY";
const PAGE_URL = document.URL;

const getIndexingInsightUrlReport = new Promise(async (resolve, reject) => {
   try {
     const response = await fetch(
        `${API_BASE_URL}/v1/url-report?url=${PAGE_URL}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${API_KEY}`,
          },
        }
      );
      // ensure the response was successful
      if (!response.ok) {
        const {error, message} = await response.json().then(res=>res || {}).catch(e=>{});
        reject(
          `Failed to fetch response from Indexing Insight API: ${response.status} ${error}: ${message}`
        );
        return;
      }

      // ensure we have a response from the ChatGPT API to our question
      const data = await response.json();

      if (!(data && data.url)) {
        reject('No response was returned from Indexing Insight API');
        return;
      }

      resolve(data);
   } catch (error) {
    reject(`Failed to fetch: \n${error}`);
    return;
   }
}

return getIndexingInsightUrlReport
  .then((objData) => {
    return seoSpider.data(Object.keys(objData).map(key=>objData[key] ? objData[key].toString() : "NULL"));
  })
  .catch((error) => {
    return seoSpider.error(error);
  });