package com.example.fcdn.ui

import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.wear.compose.material3.MaterialTheme
import androidx.wear.compose.material3.Text
import com.example.fcdn.data.ApiClient
import com.example.fcdn.util.QrCodeGenerator
import kotlinx.coroutines.delay
import java.util.UUID

@Composable
fun QrPairingScreen(onPaired: (String) -> Unit) {
    val temp_token = remember { UUID.randomUUID().toString() }
    val pair_url = remember(temp_token) { "${ApiClient.server_url}/id?token=$temp_token" }
    val qr_bitmap = remember(pair_url) { QrCodeGenerator.generateQrCode(pair_url, 180) }

    LaunchedEffect(temp_token) {
        while (true) {
            delay(2000)
            val found_user_id = ApiClient.checkPairing(temp_token)
            if (found_user_id != null) {
                onPaired(found_user_id)
                break
            }
        }
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Color.Black)
            .padding(12.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Text(
            text = "Scannez pour appairer",
            style = MaterialTheme.typography.titleSmall,
            color = MaterialTheme.colorScheme.onBackground,
            textAlign = TextAlign.Center
        )
        Spacer(modifier = Modifier.height(6.dp))
        Image(
            bitmap = qr_bitmap,
            contentDescription = "Code QR d'appairage",
            modifier = Modifier.size(130.dp)
        )
        Spacer(modifier = Modifier.height(6.dp))
        Text(
            text = "Ouvrez sur le téléphone",
            style = MaterialTheme.typography.bodySmall,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
            textAlign = TextAlign.Center
        )
    }
}
