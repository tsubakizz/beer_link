import { AdSenseUnit } from "./AdSenseUnit";

export function FooterAd() {
  const slotId = process.env.NEXT_PUBLIC_ADSENSE_SLOT_ID;
  const clientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;

  // スロットIDが設定されていない場合は何も表示しない
  if (!slotId || !clientId) {
    return null;
  }

  return (
    <div className="w-full bg-base-200/50 py-4">
      <div className="container mx-auto px-4">
        <AdSenseUnit
          slot={slotId}
          clientId={clientId}
          format="horizontal"
          responsive={true}
          className="max-w-4xl mx-auto"
        />
      </div>
    </div>
  );
}
