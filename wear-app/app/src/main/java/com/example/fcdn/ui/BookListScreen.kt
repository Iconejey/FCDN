package com.example.fcdn.ui

import androidx.compose.foundation.focusable
import androidx.compose.foundation.layout.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.focus.FocusRequester
import androidx.compose.ui.focus.focusRequester
import androidx.compose.ui.unit.dp
import androidx.wear.compose.foundation.lazy.ScalingLazyColumn
import androidx.wear.compose.foundation.lazy.items
import androidx.wear.compose.foundation.lazy.rememberScalingLazyListState
import androidx.wear.compose.foundation.rotary.RotaryScrollableDefaults
import androidx.wear.compose.foundation.rotary.rotaryScrollable
import androidx.wear.compose.material3.*

@Composable
fun BookListScreen(
    book_list: List<String>,
    onSelectBook: (String) -> Unit,
    onLogout: () -> Unit
) {
    val list_state = rememberScalingLazyListState()
    val focus_requester = remember { FocusRequester() }

    LaunchedEffect(Unit) {
        focus_requester.requestFocus()
    }

    ScalingLazyColumn(
        state = list_state,
        modifier = Modifier
            .fillMaxSize()
            .rotaryScrollable(
                behavior = RotaryScrollableDefaults.behavior(scrollableState = list_state),
                focusRequester = focus_requester
            )
            .focusRequester(focus_requester)
            .focusable(),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.spacedBy(6.dp)
    ) {
        item {
            Text(
                text = "Sélectionner un livre",
                style = MaterialTheme.typography.titleMedium,
                color = MaterialTheme.colorScheme.onBackground,
                modifier = Modifier.padding(bottom = 4.dp)
            )
        }

        items(book_list) { book ->
            Button(
                onClick = { onSelectBook(book) },
                modifier = Modifier.fillMaxWidth(0.85f)
            ) {
                Text(
                    text = book,
                    style = MaterialTheme.typography.labelLarge
                )
            }
        }

        item {
            Spacer(modifier = Modifier.height(4.dp))
        }

        item {
            OutlinedButton(
                onClick = onLogout,
                modifier = Modifier.fillMaxWidth(0.85f)
            ) {
                Text(
                    text = "Déconnexion",
                    style = MaterialTheme.typography.labelMedium
                )
            }
        }
    }
}
