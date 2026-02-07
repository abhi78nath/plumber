
import { ExecutionEnvironment } from '@/types/executor';
import { ScrollToElementTask } from '../task/ScrollToElementTask';
import waitFor from '@/lib/helper/waitFor';

export async function ScrollToElementExecutor(
  environment: ExecutionEnvironment<typeof ScrollToElementTask>
): Promise<boolean> {
  try {
    const selector = environment.getInput('Selector');
    if (!selector) {
      environment.log.error('input->selector not defined');
    }

    await (environment.getPage() as any)!.evaluate((selector: string) => {
      const element = document.querySelector(selector);
      if (!element) {
        throw new Error('Element not found');
      }
      const top = element.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top });
    }, selector);

    return true;
  } catch (error: any) {
    environment.log.error(error.message);
    return false;
  }
}