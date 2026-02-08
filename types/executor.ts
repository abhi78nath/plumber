import { Browser as PuppeteerBrowser, Page as PuppeteerPage } from 'puppeteer';
import { Browser as PlaywrightBrowser, Page as PlaywrightPage } from 'playwright';

import { WorkflowTask } from '@/types/workflow';
import { LogCollector } from './log';
// import { LogCollector } from '@/types/log';

export type Environment = {
  browser?: PuppeteerBrowser | PlaywrightBrowser;
  page?: PuppeteerPage | PlaywrightPage;

  // Phases with nodeId/taskId as key
  phases: Record<
    string, //key: nodeId/taskId
    {
      inputs: Record<string, string>;
      outputs: Record<string, string>;
    }
  >;
};

export type ExecutionEnvironment<T extends WorkflowTask> = {
  getInput(name: T['inputs'][number]['name']): string;
  setOutput(name: T['outputs'][number]['name'], value: string): void;

  getBrowser(): PuppeteerBrowser | PlaywrightBrowser | undefined;
  setBrowser(browser: PuppeteerBrowser | PlaywrightBrowser): void;

  getPage(): PuppeteerPage | PlaywrightPage | undefined;
  setPage(page: PuppeteerPage | PlaywrightPage): void;

  set(key: string, value: any): void;

  log: LogCollector;
};