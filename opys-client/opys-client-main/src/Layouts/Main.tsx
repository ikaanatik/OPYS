import React, { FC, ReactNode, useEffect, useState } from "react";
import { Box, CircularProgress, Stack } from "@mui/material";
import { Navbar, MuiBottomNavigation, Sidebar } from "@components/index";
import Cookies from "js-cookie";
import { useRouter } from "next/router";

const Main: FC<{ children: ReactNode }> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsLoggedIn(Cookies.get("token") ? true : false);
  }, [router]);
  return (
    <React.Fragment>
      {isLoggedIn ? (
        <Box minHeight={"100vh"}>
          <Navbar />
          <Stack direction={"row"} justifyContent={"space-between"}>
            <Sidebar />
            <MuiBottomNavigation />
            {children}
          </Stack>
        </Box>
      ) : (
        children
      )}
    </React.Fragment>
  );
};

export default Main;
