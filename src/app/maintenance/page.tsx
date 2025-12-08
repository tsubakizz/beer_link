export default function MaintenancePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200">
      <div className="text-center p-8">
        <h1 className="text-4xl font-bold mb-4">メンテナンス中</h1>
        <p className="text-lg text-base-content/70 mb-6">
          現在、システムメンテナンスを行っています。
          <br />
          しばらくお待ちください。
        </p>
        <div className="loading loading-spinner loading-lg text-primary"></div>
      </div>
    </div>
  );
}
