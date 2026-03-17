interface PageHeaderProps {
  title: string;
  description?: string;
}

export default function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <div className="mb-10 text-center sm:mb-14">
      <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">
        {title}
      </h1>
      {description && (
        <p className="mx-auto mt-3 max-w-2xl text-base text-[var(--color-text-muted)] sm:mt-4 sm:text-lg">
          {description}
        </p>
      )}
      <div className="mx-auto mt-5 h-1 w-16 rounded-full bg-[var(--color-primary)] sm:mt-6" />
    </div>
  );
}
