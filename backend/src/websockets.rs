use axum::extract::ws::CloseFrame;
use axum::Extension;
use axum::{
    extract::ws::{Message, WebSocket, WebSocketUpgrade},
    response::IntoResponse,
};
use tokio::sync::broadcast::{self, Receiver, Sender};

pub fn setup_socket_broadcast_channel() -> Sender<String> {
    let (tx, _): (Sender<String>, Receiver<String>) = broadcast::channel(16);
    // tx.send("test".to_string()).unwrap();
    tx
}

pub async fn websocket_handler(
    ws: WebSocketUpgrade,
    Extension(events): Extension<Sender<String>>,
) -> impl IntoResponse {
    ws.on_failed_upgrade(|error| tracing::error!("Error upgrading websocket: {}", error))
        .on_upgrade(move |socket| handle_socket(socket, events.subscribe()))
}

pub async fn handle_socket(mut socket: WebSocket, mut events: Receiver<String>) {
    loop {
        tokio::select! {
            msg = socket.recv() => {
                match msg {
                    Some(Ok(Message::Text(utf8_bytes))) => {
                        tracing::info!("Text received: {}", utf8_bytes);
                        let result = socket
                            .send(Message::Text(
                                format!("Echo back text: {}", utf8_bytes).into(),
                            ))
                            .await;
                        if let Err(error) = result {
                            tracing::info!("Error sending: {}", error);
                            send_close_message(socket, 1011, &format!("Error occured: {}", error))
                                .await;
                            break;
                        }
                    }
                    Some(Ok(Message::Binary(bytes))) => {
                        tracing::info!("Received bytes of length: {}", bytes.len());
                        let result = socket
                            .send(Message::Text(
                                format!("Received bytes of length: {}", bytes.len()).into(),
                            ))
                            .await;
                        if let Err(error) = result {
                            tracing::info!("Error sending: {}", error);
                            send_close_message(socket, 1011, &format!("Error occured: {}", error))
                                .await;
                            break;
                        }
                    }
                    Some(Ok(Message::Close(_))) | None => break,

                    Some(Err(error)) => {
                        tracing::error!("WebSocket receive error: {}", error);
                        break;
                    }

                    _ => {}
                }
            }

            event = events.recv() => {
                match event {
                    Ok(event) => {
                        if socket
                            .send(Message::Text(event.into()))
                            .await
                            .is_err()
                        {
                            break;
                        }
                    }

                    Err(tokio::sync::broadcast::error::RecvError::Lagged(count)) => {
                        tracing::warn!("WebSocket missed {count} events");
                    }

                    Err(tokio::sync::broadcast::error::RecvError::Closed) => break,
                }
            }

        }
    }
}

// Close Code: https://kapeli.com/cheat_sheets/WebSocket_Status_Codes.docset/Contents/Resources/Documents/index
pub async fn send_close_message(mut socket: WebSocket, code: u16, reason: &str) {
    _ = socket
        .send(Message::Close(Some(CloseFrame {
            code: code,
            reason: reason.into(),
        })))
        .await;
}
