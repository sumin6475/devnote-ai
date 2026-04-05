// 난이도 표시 컴포넌트 — 별 아이콘 (이모티콘 아님)

import Icon from './Icons';

type DifficultyStarsProps = {
  level: number;
};

const DifficultyStars = ({ level }: DifficultyStarsProps) => {
  return (
    <span className="inline-flex gap-[2px]">
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} style={{ opacity: i <= level ? 1 : 0.2 }}>
          <Icon name="star" color="#818cf8" />
        </span>
      ))}
    </span>
  );
};

export default DifficultyStars;
