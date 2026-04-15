import { createContext, useContext, useEffect, useState } from "react";
import { useAuth, useUser } from "@clerk/clerk-react";
import axios from "axios";

export const UserDataContext = createContext();

export const useUserData = () => useContext(UserDataContext);

function UserContext({ children }) {
    const serverUrl = "http://localhost:5000";

    const { getToken, isSignedIn } = useAuth();
    const { user } = useUser();

    const [dbUser, setDbUser] = useState(null);

    const syncUser = async () => {
        try {
            const token = await getToken();

            const res = await axios.post(
                serverUrl + "/api/users/create",
                {},
                {
                    headers: {
                        Authorization: "Bearer " + token,
                    },
                }
            );

            setDbUser(res.data);
        } catch (err) {
            console.log("User sync error");
        }
    };

    useEffect(() => {
        if (isSignedIn && user && !dbUser) {
            syncUser();
        }
    }, [isSignedIn, user]);

    const value = {
        serverUrl,
        dbUser,
    };

    return (
        <UserDataContext.Provider value={value}>
            {children}
        </UserDataContext.Provider>
    );
}

export default UserContext;