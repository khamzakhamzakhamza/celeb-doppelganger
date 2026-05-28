import './Title.scss';

type TitleProps = {
  title: string;
  color?: string;
  fontSize?: React.CSSProperties["fontSize"];
  fontWeight?: React.CSSProperties["fontWeight"];
  letterSpacing?: string;
  glowMode?: "pulse" | "static";
};

export function Title({
  title,
  color,
  fontSize,
  fontWeight,
  letterSpacing,
  glowMode = "static",
}: TitleProps) {  
  return (
    <h1
      className={`title 
        ${glowMode === 'pulse' 
        ? 'title--glow-pulse' 
        : 'title--glow-static'}`}
      style={{
        fontSize,
        fontWeight,
        letterSpacing,
        color,
      }}
    >
      {title}
    </h1>
  );
}
