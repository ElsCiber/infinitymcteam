import { Badge } from "@/components/ui/badge";
import { Trophy } from "lucide-react";

interface UserBadgeProps {
  eventsAttended: number;
  showIcon?: boolean;
}

const UserBadge = ({ eventsAttended, showIcon = true }: UserBadgeProps) => {
  const getBadgeInfo = () => {
    if (eventsAttended >= 10) {
      return { variant: "legendario" as const, label: "Legendario", icon: "🏆" };
    } else if (eventsAttended >= 5) {
      return { variant: "veterano" as const, label: "Veterano", icon: "⭐" };
    } else {
      return { variant: "novato" as const, label: "Novato", icon: "🎮" };
    }
  };

  const { variant, label, icon } = getBadgeInfo();

  return (
    <Badge variant={variant} className="text-sm px-3 py-1">
      {showIcon && <span className="mr-1">{icon}</span>}
      {label}
    </Badge>
  );
};

export default UserBadge;
