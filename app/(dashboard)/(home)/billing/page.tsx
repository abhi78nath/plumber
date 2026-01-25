import { getCreditsUsageInPeriod } from "@/actions/analytics/getCreditsUsageInPeriod";
import { Period } from "@/types/analytics";
import CreditUsageChart from "./_components/CreditUsageChart";

async function CreditUsageCard() {
    const period: Period = {
      month: new Date().getMonth(),
      year: new Date().getFullYear(),
    };
  
    const data = await getCreditsUsageInPeriod(period);
  
    return (
      <CreditUsageChart data={data} title="Credits consumed" description="Daily credit consumed in the current month" />
    );
  }