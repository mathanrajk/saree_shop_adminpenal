import { Skeleton } from "@mui/material";

function SkeletonCard() {
  return (
    <div
      style={{
        backgroundColor: "#ffffff",
        border: "1px solid #e2e8f0",
        borderRadius: "12px",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
      }}
    >
      <Skeleton
        variant="rectangular"
        width="100%"
        height={280}
        sx={{ bgcolor: "#f1f5f9" }}
      />
      <div
        style={{
          padding: "1rem",
          display: "flex",
          flexDirection: "column",
          gap: "0.75rem",
        }}
      >
        <div>
          <Skeleton variant="text" sx={{ fontSize: "1rem", width: "90%" }} />
          <Skeleton variant="text" sx={{ fontSize: "0.85rem", width: "60%" }} />
        </div>
        <Skeleton
          variant="rectangular"
          width={70}
          height={20}
          sx={{ borderRadius: "4px" }}
        />
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            paddingTop: "0.75rem",
            borderTop: "1px solid #f1f5f9",
          }}
        >
          <Skeleton variant="text" sx={{ fontSize: "1.2rem", width: "35%" }} />
          <Skeleton
            variant="rectangular"
            width={65}
            height={28}
            sx={{ borderRadius: "6px" }}
          />
        </div>
      </div>
    </div>
  );
}

export default SkeletonCard;
