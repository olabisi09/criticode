interface CardProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
}

export const Card: React.FC<CardProps> = ({
  children,
  title,
  className = '',
}) => {
  return (
    <div
      className={`
        bg-card text-card-foreground rounded-lg shadow-md border border-border
        ${className}
      `
        .trim()
        .replace(/\s+/g, ' ')}
    >
      {title && (
        <div className="px-6 py-4 border-b border-border">
          <h3 className="text-lg font-medium text-card-foreground">{title}</h3>
        </div>
      )}

      <div className={title ? 'p-6' : 'p-6'}>{children}</div>
    </div>
  );
};
