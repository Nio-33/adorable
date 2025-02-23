import React from 'react';
import {
  FlatList,
  RefreshControl,
  ActivityIndicator,
  StyleSheet,
  View,
  ViewStyle,
  ListRenderItem,
} from 'react-native';
import { COLORS, SPACING } from '../../../config/theme';
import { Typography } from '../../atoms/Typography/Typography';

interface ListProps<T> {
  data: T[];
  renderItem: ListRenderItem<T>;
  loading?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
  emptyText?: string;
  ListEmptyComponent?: React.ReactElement;
  style?: ViewStyle;
  contentContainerStyle?: ViewStyle;
  ItemSeparatorComponent?: React.ComponentType<any>;
  keyExtractor?: (item: T, index: number) => string;
  onEndReached?: () => void;
  onEndReachedThreshold?: number;
  ListHeaderComponent?: React.ComponentType<any> | React.ReactElement;
  ListFooterComponent?: React.ComponentType<any> | React.ReactElement;
}

export function List<T>({
  data,
  renderItem,
  loading = false,
  refreshing = false,
  onRefresh,
  emptyText = 'No items found',
  ListEmptyComponent,
  style,
  contentContainerStyle,
  ItemSeparatorComponent,
  keyExtractor,
  onEndReached,
  onEndReachedThreshold = 0.5,
  ListHeaderComponent,
  ListFooterComponent,
}: ListProps<T>) {
  if (loading && !refreshing && data.length === 0) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator color={COLORS.primary.main} size="large" />
      </View>
    );
  }

  const renderEmpty = () => {
    if (ListEmptyComponent) {
      return ListEmptyComponent;
    }

    return (
      <View style={styles.emptyContainer}>
        <Typography
          variant="body1"
          color={COLORS.text.secondary}
          style={styles.emptyText}
        >
          {emptyText}
        </Typography>
      </View>
    );
  };

  return (
    <FlatList
      data={data}
      renderItem={renderItem}
      style={[styles.container, style]}
      contentContainerStyle={[
        styles.contentContainer,
        data.length === 0 && styles.emptyContentContainer,
        contentContainerStyle,
      ]}
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary.main]}
            tintColor={COLORS.primary.main}
          />
        ) : undefined
      }
      ListEmptyComponent={renderEmpty}
      ItemSeparatorComponent={ItemSeparatorComponent}
      keyExtractor={keyExtractor}
      onEndReached={onEndReached}
      onEndReachedThreshold={onEndReachedThreshold}
      ListHeaderComponent={ListHeaderComponent}
      ListFooterComponent={
        <View>
          {typeof ListFooterComponent === 'function'
            ? <ListFooterComponent />
            : ListFooterComponent}
          {loading && data.length > 0 && (
            <ActivityIndicator
              color={COLORS.primary.main}
              style={styles.footerLoader}
            />
          )}
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
  },
  emptyContentContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  emptyText: {
    textAlign: 'center',
  },
  footerLoader: {
    padding: SPACING.lg,
  },
}); 