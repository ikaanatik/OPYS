import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import TextField from "@mui/material/TextField";
import Link from "@mui/material/Link";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import React, { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { AuthAction } from "@store/actions/index";
import { useRouter } from "next/router";
import Cookies from "js-cookie";
import Image from "next/image";
export interface ISignInProps {
  email: string;
  password: string;
}
export default function SignIn() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const dispatch = useDispatch<any>();
  // Hooks
  const onChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm({ ...form, [e.target.name]: e.target.value });
    },
    [form]
  );
  useEffect(() => {
    router.prefetch("/");
  }, []);
  useEffect(() => {
    if (!Cookies.get("token")) {
      setIsLoggedIn(true);
    } else {
      router.push("/");
    }
  }, []);
  return (
    
    <React.Fragment>
      
      {isLoggedIn && (
        
            
        
        <Container component="main" maxWidth="xs"
        sx={{color: "#0275d8"}}>
          <CssBaseline />
          <Box
            sx={{
              marginTop: 8,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Image
          src="https://opys.fra1.digitaloceanspaces.com/opyslogo.jpg"
          width={75}
          height={75}
        />
            <Typography align="center" component="h1" variant="h5">
              OPYS <br></br>
              Öğrenci Proje Yönetim Sistemi
            </Typography>
            <Box
              component="form"
              onSubmit={(e: React.FormEvent<HTMLFormElement>) => {
                e.preventDefault();
                dispatch(AuthAction.Login(form, router));
              }}
              noValidate
              sx={{ mt: 1 }}
            >
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                onChange={onChange}
                label="Email Adresi"
                name="email"
                autoComplete="email"
                autoFocus
              />
              <TextField
                margin="normal"
                required
                fullWidth
                onChange={onChange}
                name="password"
                label="Parola"
                type="password"
                id="password"
                autoComplete="current-password"
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
              >
                Giriş Yap
              </Button>
              <Grid container>
                <Grid item xs>
                  <Link href="/auth/forgot-password" variant="body2">
                    Parolamı unuttum
                  </Link>
                </Grid>
              </Grid>
            </Box>
          </Box>
          <Box sx={{borderColor:"black", color: 'black'}}>
          <br></br>
          Öğrenciler için öğrenci eposta <br></br>(örn. "21534564@mail.baskent.edu.tr") ve <br></br>Üniversitenizin size verdiği şifre ile giriş yapınız.
<br></br> <br></br>
Öğretim elemanları için eposta adresinizi <br></br>(örn "aozturk@baskent.edu.tr" gibi) giriniz.
          </Box>

        </Container>
        
      )}
    </React.Fragment>
  );
}
