import { Stack } from "expo-router";
import { View } from "react-native";
import AssignmentForm from "../../../components/assignments/assignmentForm";

export default function AssignmentCreate() {
    return (
        <View>
            <Stack.Screen options={{ headerShown: false }} />
            <AssignmentForm />
        </View>
    );
}