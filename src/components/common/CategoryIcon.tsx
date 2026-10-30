import React from 'react';
import {
  Droplet,
  Zap,
  Hammer,
  Paintbrush,
  Home,
  Wind,
  Shield,
  Wrench,
  Sparkles,
  Truck,
  Scissors,
  Key,
  Flame,
  Sun,
  PenTool,
  Layers,
  Settings,
  Package,
  ShoppingBag,
  Box,
  Tag,
  Cpu,
  HardHat,
  LucideIcon
} from 'lucide-react-native';
import { NexoraColors } from '@/constants/theme';

interface CategoryIconProps {
  name?: string;
  size?: number;
  color?: string;
}

const ICON_MAP: Record<string, LucideIcon> = {
  Droplet,
  Zap,
  Hammer,
  Paintbrush,
  Home,
  Wind,
  Shield,
  Wrench,
  Sparkles,
  Truck,
  Scissors,
  Key,
  Flame,
  Sun,
  PenTool,
  Layers,
  Settings,
  Package,
  ShoppingBag,
  Box,
  Tag,
  Cpu,
  HardHat,
};

export const CategoryIcon: React.FC<CategoryIconProps> = ({
  name = 'Wrench',
  size = 20,
  color = NexoraColors.primary,
}) => {
  const IconComponent = (name && ICON_MAP[name]) ? ICON_MAP[name] : Wrench;
  return <IconComponent size={size} color={color} />;
};

export default CategoryIcon;
