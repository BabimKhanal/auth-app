import ProfileForm from "@/components/ProfileForm";
import { ScrollView, View } from "react-native";

export default function Profile() {
    return (
        <ScrollView>
            <View style={{

                backgroundColor: "#fff",
                marginTop: "20%",
                marginBottom: "20%",
            }}>
                <ProfileForm />
            </View>
        </ScrollView>
    );
}