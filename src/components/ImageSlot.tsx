import Image from "next/image";

type Props = { src?: string | null; alt: string; placeholderLabel: string };

/** 이미지가 아직 업로드되지 않은 자리를 자연스럽게 보여준다.
 *  관리자 미디어 업로드가 붙으면 src가 채워지며 실제 사진으로 바뀐다. */
export function ImageSlot({ src, alt, placeholderLabel }: Props) {
  if (src) {
    return (
      <div className="image-slot">
        <Image src={src} alt={alt} fill sizes="(max-width: 800px) 100vw, 45vw" style={{ objectFit: "cover" }} />
      </div>
    );
  }
  return (
    <div className="image-slot">
      <span aria-hidden="true">必</span>
      <small>{placeholderLabel}</small>
    </div>
  );
}
