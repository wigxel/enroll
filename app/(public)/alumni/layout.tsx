import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Alumni | CMK",
};

export type AlumniLayoutProps = {
  children: React.ReactNode;
};

export function AlumniLayout(props: AlumniLayoutProps) {
  const { children } = props;

  return children;
}
export default AlumniLayout;
