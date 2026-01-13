export default function PageHeader({ title }: { title: string }) {
    return (
      <main className="flex w-full flex-col justify-between py-2 items-start">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white sm:text-2xl">
          {title}
        </h1>
      </main>
    );
  }
  