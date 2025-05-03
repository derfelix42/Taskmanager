# Use a base image with the latest version of Rust installed
FROM rust:latest

# RUN apt update
# RUN apt install -y libpcap-dev iproute2 wireless-tools

# Set the working directory in the container
WORKDIR /app

# Copy the local application code into the container
COPY ./backend/ .

# Build documentation
# RUN cargo doc

# Build the Rust application
RUN cargo build --release

# Specify the command to run when the container starts
CMD ["./target/release/backend"]

