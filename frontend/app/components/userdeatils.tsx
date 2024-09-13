interface User {
  email: string;
  password: string;
  phonenumber: string;
  name: string;
}

export function Userdetails({ email, password, phonenumber, name }: User) {
  return (
    <div>
      <h2>`MY Name is ${}` </h2>
    </div>
  );
}
