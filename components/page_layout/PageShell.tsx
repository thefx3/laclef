export default function PageShell({
    children,
  }: {
    children: React.ReactNode;
  }) {
    return (
      <div className="flex flex-1 flex-col gap-5 w-full mx-auto font-sans">
        {children}
      </div>
    );
  }
  