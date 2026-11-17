package com.example.fcdn.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.wear.compose.foundation.lazy.ScalingLazyColumn
import androidx.wear.compose.foundation.lazy.items
import androidx.wear.compose.material.Chip
import androidx.wear.compose.material.ChipDefaults
import androidx.wear.compose.material.Text

@Composable
fun BookListScreen(
    book_list: List<String>,
    onSelectBook: (String) -> Unit,
    onLogout: () -> Unit
) {
    ScalingLazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .background(Color.Black),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        item {
            Text(
                text = "Select Book",
                color = Color.White,
                modifier = Modifier.padding(bottom = 4.dp)
            )
        }

        items(book_list) { book_name ->
            Chip(
                label = { Text(text = book_name, color = Color.White) },
                onClick = { onSelectBook(book_name) },
                colors = ChipDefaults.primaryChipColors(),
                modifier = Modifier.fillMaxWidth(0.85f)
            )
        }

        item {
            Spacer(modifier = Modifier.height(8.dp))
            Chip(
                label = { Text(text = "Logout", color = Color.Red) },
                onClick = onLogout,
                colors = ChipDefaults.secondaryChipColors(),
                modifier = Modifier.fillMaxWidth(0.75f)
            )
        }
    }
}
