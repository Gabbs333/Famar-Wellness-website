export default function Logo({ className = "h-12 w-auto" }: { className?: string }) {
  return (
    <img 
      src="/logo.png" 
      alt="FAMAR Wellness" 
      className={`${className} object-contain`} 
    />
  );
}
