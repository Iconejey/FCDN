package com.example.fcdn.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.wear.compose.material3.MaterialTheme
import androidx.wear.compose.material3.Text

@Composable
fun NumpadDialog(
    title: String = "Enter Chapter",
    onConfirm: (Int?) -> Unit,
    onDismiss: () -> Unit
) {
    var input_str by remember { mutableStateOf("") }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Color.Black)
            .padding(4.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Text(
            text = if (input_str.isEmpty()) title else input_str,
            fontFamily = FontFamily.Serif,
            fontSize = 18.sp,
            fontWeight = FontWeight.Bold,
            color = MaterialTheme.colorScheme.onBackground,
            modifier = Modifier.padding(vertical = 4.dp)
        )

        val keys = listOf(
            listOf("1", "2", "3"),
            listOf("4", "5", "6"),
            listOf("7", "8", "9"),
            listOf("C", "0", "OK")
        )

        for (row in keys) {
            Row(
                horizontalArrangement = Arrangement.spacedBy(6.dp),
                modifier = Modifier.padding(vertical = 2.dp)
            ) {
                for (key in row) {
                    Box(
                        contentAlignment = Alignment.Center,
                        modifier = Modifier
                            .size(36.dp)
                            .clip(CircleShape)
                            .background(
                                if (key == "OK") MaterialTheme.colorScheme.primaryContainer
                                else if (key == "C") MaterialTheme.colorScheme.errorContainer
                                else MaterialTheme.colorScheme.surfaceContainer
                            )
                            .clickable {
                                if (key == "OK") {
                                    val parsed_num = input_str.toIntOrNull()
                                    onConfirm(parsed_num)
                                } else if (key == "C") {
                                    if (input_str.isNotEmpty()) {
                                        input_str = input_str.dropLast(1)
                                    } else {
                                        onDismiss()
                                    }
                                } else {
                                    if (input_str.length < 5) {
                                        input_str += key
                                    }
                                }
                            }
                    ) {
                        Text(
                            text = key,
                            color = if (key == "OK") MaterialTheme.colorScheme.onPrimaryContainer
                                   else if (key == "C") MaterialTheme.colorScheme.onErrorContainer
                                   else MaterialTheme.colorScheme.onSurface,
                            fontSize = 14.sp,
                            fontWeight = FontWeight.Bold
                        )
                    }
                }
            }
        }
    }
}
