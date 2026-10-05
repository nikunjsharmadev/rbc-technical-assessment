const API_URL = 'https://jsonplaceholder.typicode.com/posts';
const delay = (milliseconds: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, milliseconds));

export const fetchThreeTimes = async (): Promise<void> => {
  // Requests are intentionally sequential with a 1-second delay
  // between each request as required by the assessment.
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const response = await fetch(API_URL);
      // fetch() does not reject for HTTP error status codes,
      // so explicitly validate the response.
      if (!response.ok) throw new Error(`Request ${attempt} failed with status ${response.status}`);
      const data = await response.json();
      console.log(`Request ${attempt}: `, data);
      console.log(data);
      // No delay is needed after the final request.
      if (attempt < 3) await delay(1000);
    } catch (error) {
      console.error(`Request ${attempt} failed: `, error);
    }
  }
};
