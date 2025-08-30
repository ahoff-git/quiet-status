import styles from "./HighlightedText.module.css";
import type { HighlightTerm } from "@/keyTerms";

function escapeRegExp(str: string) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export default function HighlightedText({
  text,
  terms,
}: {
  text: string;
  terms: HighlightTerm[];
}) {
  if (terms.length === 0) return text;

  const regex = new RegExp(`(${terms.map((t) => escapeRegExp(t.term)).join("|")})`, "gi");
  const parts = text.split(regex);

  return (
    <>
      {parts.map((part, i) => {
        const match = terms.find(
          (term) => term.term.toLowerCase() === part.toLowerCase()
        );
        return match ? (
          <span
            key={i}
            className={styles.highlight}
            style={{ color: match.color }}
          >
            {part}
          </span>
        ) : (
          part
        );
      })}
    </>
  );
}
