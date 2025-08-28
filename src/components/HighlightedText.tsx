import styles from "./HighlightedText.module.css";

function escapeRegExp(str: string) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export default function HighlightedText({
  text,
  terms,
}: {
  text: string;
  terms: string[];
}) {
  if (terms.length === 0) return text;

  const regex = new RegExp(`(${terms.map(escapeRegExp).join("|")})`, "gi");
  const parts = text.split(regex);

  return (
    <>
      {parts.map((part, i) =>
        terms.some((term) => term.toLowerCase() === part.toLowerCase()) ? (
          <span key={i} className={styles.highlight}>
            {part}
          </span>
        ) : (
          part
        )
      )}
    </>
  );
}
