import { useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Review } from "../types/movie";

const ReviewItem = ({ review }: { review: Review }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <View key={`${review.id}-${review.created_at}`} style={styles.reviewCard}>
            <Text style={styles.reviewAuthor}>{review.author}</Text>

            <Text
                style={styles.reviewContent}
                numberOfLines={isExpanded ? undefined : 3}
                ellipsizeMode="tail"
                onPress={() => setIsExpanded(!isExpanded)}
            >
                {review.content}
            </Text>

            {review.content.length > 100 && (
                <Text
                    onPress={() => setIsExpanded(!isExpanded)}
                    style={styles.showMoreText}
                >
                    {isExpanded ? "Show Less" : "Read More..."}
                </Text>)
            }
        </View>
    );
};

const styles = StyleSheet.create({
    showMoreText: {
        fontSize: 14,
        color: '#007AFF',
        marginTop: 4,
        alignSelf: 'flex-start',
    },
    reviewCard: {
        padding: 10,
        borderRadius: 10,
        backgroundColor: '#1e293b',
        marginBottom: 8,
    },
    reviewAuthor: {
        color: '#f8fafc',
        fontWeight: '700',
        marginBottom: 4,
    },
    reviewContent: {
        color: '#cbd5e1',
    },
});

export default ReviewItem