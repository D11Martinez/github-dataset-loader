import { Readable } from 'stream';
import * as zlib from 'zlib';
import { requestTimeout } from '../common/constants';
import axios, { AxiosRequestConfig } from 'axios';

export async function decompressBuffer(
  rawData: Buffer,
  filename: string,
): Promise<string> {
  return new Promise((resolve, reject) => {
    zlib.gunzip(rawData, function (err, buffer) {
      if (err)
        console.error(
          `-- ${new Date().toISOString()} --filename = ${filename} || --message = Hubo un problema al cargar la data`,
        );

      resolve(buffer.toString());
    });
  });
}

export async function fetchData(
  url: string,
  useGithubAuth: boolean,
): Promise<Buffer> {
  try {
    const requestOptions: AxiosRequestConfig = {
      responseType: 'stream',
      timeout: requestTimeout,
    };

    if (useGithubAuth) {
      const { USERNAME_GITHUB: username, TOKEN_GITHUB: password } = process.env;

      requestOptions.auth = { username, password };
    }

    const response = await axios.get(url, requestOptions);

    const dataStream: Readable = response.data;

    return await new Promise(async (resolve, reject) => {
      let dataBufferArr = [];

      dataStream.on('data', (chunk) => {
        dataBufferArr.push(chunk);
      });

      dataStream.on('end', () => {
        const rawData = Buffer.concat(dataBufferArr);

        resolve(rawData);
      });

      dataStream.on('error', (fooErr) => console.error(fooErr.message));
    });
  } catch (error) {
    console.error(
      `-- ${new Date().toISOString()} --url = ${url} || --message = ${
        error.message
      }`,
    );
  }
}
