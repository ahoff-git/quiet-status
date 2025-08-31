import styles from "./HighlightedText.module.css";
import { useMemo } from "react";
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
  const regex = useMemo(() => {
    if (terms.length === 0) return null;
    const all = terms.flatMap((t) => t.terms);
    all.sort((a, b) => b.length - a.length);
    return new RegExp(`\\b(${all.map((term) => escapeRegExp(term)).join("|")})\\b`, "gi");
  }, [terms]);

  if (!regex) return text;

  const parts = text.split(regex);

  return (
    <>
      {parts.map((part, i) => {
        const match = terms.find((term) =>
          term.terms.some((t) => t.toLowerCase() === part.toLowerCase())
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
