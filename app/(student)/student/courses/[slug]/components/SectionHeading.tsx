interface SectionHeadingProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}

export function SectionHeading({ icon, title, subtitle }: SectionHeadingProps) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 flex bg-primary/16 text-primary h-9 w-9 shrink-0 items-center justify-center rounded-xl">
        {icon}
      </div>
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          {title}
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>
      </div>
    </div>
  );
}
