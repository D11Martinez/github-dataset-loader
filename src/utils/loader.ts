import axios from 'axios';
import * as zlib from 'zlib';

export async function fetchData(filename: string): Promise<string> {
  const url = `${process.env.GITHUB_URL_API}/${filename}.json.gz`;
  const { data: rawData } = await axios.get(url, {
    responseType: 'arraybuffer',
  });

  return await new Promise(async (resolve) => {
    zlib.gunzip(rawData, function (err, buffer) {
      if (err)
        console.error(
          `-- ${Date.now()} --filename = ${filename} || --message = There was an error loading the data`,
        );

      resolve(buffer.toString());
    });
  });
}

export function filterEventsByType(rawData: string | null, eventType: string) {
  if (!rawData) return [];

  return rawData
    .split(/\r?\n/)
    .slice(0, -2)
    .map((eventString) => JSON.parse(eventString))
    .filter((object) => object.type === eventType);
}

export async function getEvents(filename: string, eventType: string) {
  const data = await fetchData(filename);
  return filterEventsByType(data, eventType);
}
