import React from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
  StyleProp,
  ScrollView,
  RefreshControl,
  ListRenderItem,
  ListRenderItemInfo,
  ActivityIndicator,
} from 'react-native';
import { COLORS, SPACING } from '../../../config/theme';
import { BaseComponentProps } from '../../common/types';
import { Typography } from '../../atoms/Typography';
import { Loading } from '../../atoms/Loading';

export interface ListProps<T> extends BaseComponentProps {
  data?: T[];
  title?: string;
  subtitle?: string;
  loading?: boolean;
  refreshing?: boolean;
  error?: string | undefined;
  onRefresh?: () => void;
  onEndReached?: () => void;
  onEndReachedThreshold?: number;
  emptyText?: string;
  headerRight?: React.ReactNode;
  ListHeaderComponent?: React.ReactNode;
  ListFooterComponent?: React.ReactNode;
  ListEmptyComponent?: React.ReactNode;
  scrollEnabled?: boolean;
  renderItem?: ListRenderItem<T>;
  children?: React.ReactNode;
}

export function List<T>({
  data,
  title,
  subtitle,
  loading = false,
  refreshing = false,
  error,
  onRefresh,
  onEndReached,
  onEndReachedThreshold = 0.5,
  emptyText = 'No items to display',
  headerRight,
  ListHeaderComponent,
  ListFooterComponent,
  ListEmptyComponent,
  scrollEnabled = true,
  renderItem,
  style,
  children,
  testID,
}: ListProps<T>) {
  const containerStyle: StyleProp<ViewStyle> = [
    styles.container,
    style,
  ];

  const hasHeader = title || subtitle || headerRight;
  const isEmpty = !children && (!data || data.length === 0);

  const handleScroll = (event: any) => {
    if (!onEndReached) return;

    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const paddingToBottom = contentSize.height * onEndReachedThreshold;
    const isEndReached = layoutMeasurement.height + contentOffset.y >= 
      contentSize.height - paddingToBottom;

    if (isEndReached && !loading && !refreshing) {
      onEndReached();
    }
  };

  const renderHeader = () => {
    if (!hasHeader) return null;

    return (
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          {title && (
            <Typography variant="h4" style={styles.title}>
              {title}
            </Typography>
          )}
          {subtitle && (
            <Typography
              variant="body2"
              color={COLORS.text.secondary}
              style={styles.subtitle}
            >
              {subtitle}
            </Typography>
          )}
        </View>
        {headerRight && (
          <View style={styles.headerRight}>{headerRight}</View>
        )}
      </View>
    );
  };

  const renderContent = () => {
    if (loading && !refreshing && !data?.length) {
      return <Loading text="Loading..." />;
    }

    if (error) {
      return (
        <Typography
          variant="body2"
          color={COLORS.status.error}
          style={styles.message}
        >
          {error}
        </Typography>
      );
    }

    if (isEmpty) {
      return ListEmptyComponent || (
        <Typography
          variant="body2"
          color={COLORS.text.secondary}
          style={styles.message}
        >
          {emptyText}
        </Typography>
      );
    }

    if (renderItem && data) {
      return data.map((item, index) => {
        const info: ListRenderItemInfo<T> = {
          item,
          index,
          separators: {
            highlight: () => {},
            unhighlight: () => {},
            updateProps: () => {},
          },
        };
        return renderItem(info);
      });
    }

    return children;
  };

  const renderFooter = () => {
    if (loading && !refreshing && data?.length) {
      return (
        <View style={styles.loadingFooter}>
          <ActivityIndicator color={COLORS.primary} />
        </View>
      );
    }
    return ListFooterComponent;
  };

  const Container = scrollEnabled ? ScrollView : View;
  const containerProps = scrollEnabled
    ? {
        showsVerticalScrollIndicator: false,
        refreshControl: onRefresh ? (
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        ) : undefined,
        onScroll: handleScroll,
        scrollEventThrottle: 16,
      }
    : {};

  return (
    <Container
      style={containerStyle}
      testID={testID}
      {...containerProps}
    >
      {renderHeader()}
      {ListHeaderComponent}
      {renderContent()}
      {renderFooter()}
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    marginLeft: SPACING.md,
  },
  title: {
    marginBottom: SPACING.xs,
  },
  subtitle: {
    marginBottom: SPACING.xs,
  },
  message: {
    padding: SPACING.lg,
    textAlign: 'center',
  },
  loadingFooter: {
    padding: SPACING.md,
    alignItems: 'center',
  },
}); 