import { Navbar } from "flowbite-react";

function AppBar() {

  return (
    <Navbar fluid={true} rounded={true}>
      <Navbar.Brand href="/">
        <img
          src="/logo.svg" // Replace with your logo
          className="mr-3 h-6 sm:h-9"
          alt="Your Logo"
        />
        <span className="self-center whitespace-nowrap text-xl font-semibold dark:text-white">
          My App
        </span>
      </Navbar.Brand>
      <Navbar.Toggle />
      <Navbar.Collapse>
        <Navbar.Link href="/" active={true}>
          Home
        </Navbar.Link>
        <Navbar.Link href="/about">About</Navbar.Link>
        <Navbar.Link href="/services">Services</Navbar.Link>
        <Navbar.Link href="/contact">Contact</Navbar.Link>
      </Navbar.Collapse>
    </Navbar>
  )
}

export default AppBar;
