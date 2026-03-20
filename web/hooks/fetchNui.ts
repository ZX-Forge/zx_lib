import { useCallback } from 'react';
import { isEnvBrowser } from '../utils/env';

type NuiPayload = Record<string, unknown>;

declare function GetParentResourceName(): string;

async function postNui<TResponse = unknown, TData extends NuiPayload = NuiPayload>(
  eventName: string,
  data?: TData,
): Promise<TResponse> {
  if (isEnvBrowser()) {
    return Promise.resolve({} as TResponse);
  }

  const resourceName = typeof GetParentResourceName === 'function'
    ? GetParentResourceName()
    : 'nui-resource';

  const response = await fetch(`https://${resourceName}/${eventName}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=UTF-8',
    },
    body: JSON.stringify(data ?? {}),
  });

  return response.json() as Promise<TResponse>;
}

export function useFetchNui() {
  return useCallback(postNui, []);
}

export { postNui as fetchNui };
