/**
 * ATTENDIFY UI Components Index
 * 
 * This file serves as a reference for all available modern UI components
 * in the Attendify application. All components support animations,
 * glassmorphism, and the design system.
 */

// Buttons
export { default as AnimatedButton } from './AnimatedButton';
export type { default as AnimatedButtonType } from './AnimatedButton';

// Cards & Containers
export { default as AnimatedCard } from './AnimatedCard';
export { default as DashboardCard } from './DashboardCard';
export { default as StudentCard } from './StudentCard';

// Input Components
export { default as AnimatedInput } from './AnimatedInput';

// Loading & Empty States
export { default as SkeletonLoader, Skeleton } from './SkeletonLoader';
export { default as EmptyState } from './EmptyState';

// Notifications
export { 
  default as ModernToast,
  Toast,
  ToastStack,
  useToast,
  showToast,
  type ToastType,
  type ToastConfig
} from './ModernToast';

/**
 * USAGE EXAMPLES
 * 
 * Import Example:
 * import { AnimatedButton, DashboardCard, StudentCard } from '@/components/ui';
 * 
 * Component Examples:
 * 
 * 1. Dashboard Statistics
 *    <DashboardCard
 *      title="Total Students"
 *      value="125"
 *      subtitle="Active"
 *      icon={Users}
 *      delay={0}
 *    />
 * 
 * 2. Student List Item
 *    <StudentCard
 *      name="Ahmad Fauzi"
 *      identifier="20240007"
 *      status="hadir"
 *      waktu="08:15"
 *      actionLabel="Edit"
 *      onAction={handleEdit}
 *    />
 * 
 * 3. Form Input with Validation
 *    <AnimatedInput
 *      icon={Mail}
 *      label="Email"
 *      placeholder="Enter email..."
 *      value={email}
 *      onChangeText={setEmail}
 *      error={errors.email}
 *    />
 * 
 * 4. Loading State
 *    {isLoading ? (
 *      <SkeletonLoader variant="dashboard" />
 *    ) : (
 *      <View>{/* content *\/}</View>
 *    )}
 * 
 * 5. Empty State
 *    <EmptyState
 *      type="no-students"
 *      actionLabel="Add Student"
 *      onAction={handleAdd}
 *    />
 * 
 * 6. Toast Notification
 *    import { showToast } from '@/components/ui/ModernToast';
 *    showToast({
 *      type: 'success',
 *      title: 'Success!',
 *      message: 'Student added successfully',
 *      duration: 3000
 *    });
 * 
 * 7. Animated Container
 *    <AnimatedCard variant="glass" delay={100}>
 *      <Text>Card content with glassmorphism</Text>
 *    </AnimatedCard>
 * 
 * 8. Loading Skeleton
 *    <Skeleton width="100%" height={100} borderRadius={12} />
 */
