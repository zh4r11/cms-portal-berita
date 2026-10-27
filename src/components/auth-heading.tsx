export function AuthHeading({ title, description }: { title: string; description?: string }) {
  return (
    <div className="-mt-4 space-y-2 text-center">
      <h1 className="text-xl font-medium">{title}</h1>
      {description && <p className="text-center text-sm text-muted-foreground">{description}</p>}
    </div>
  );
}
