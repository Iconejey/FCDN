package com.example.fcdn.ui

import androidx.compose.foundation.ExperimentalFoundationApi
import androidx.compose.foundation.background
import androidx.compose.foundation.combinedClickable
import androidx.compose.foundation.layout.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.wear.compose.foundation.lazy.ScalingLazyColumn
import androidx.wear.compose.foundation.lazy.itemsIndexed
import androidx.wear.compose.material.Text

@OptIn(ExperimentalFoundationApi::class)
@Composable
fun ChapterListScreen(
    book_name: String,
    chap_history: List<Int>,
    onAddChapter: (Int) -> Unit,
    onDeleteCurrentChapter: () -> Unit,
    onPromoteChapter: (Int) -> Unit
) {
    var show_numpad by remember { mutableStateOf(false) }
    var confirm_delete by remember { mutableStateOf(false) }
    var confirm_promote_target by remember { mutableStateOf<Int?>(null) }

    if (show_numpad) {
        NumpadDialog(
            onConfirm = { new_chap ->
                show_numpad = false
                onAddChapter(new_chap)
            },
            onCancel = {
                show_numpad = false
            }
        )
        return
    }

    if (confirm_delete) {
        val current_val = chap_history.firstOrNull() ?: 0
        ConfirmDialog(
            title = "Delete current chapter $current_val?",
            onConfirm = {
                confirm_delete = false
                onDeleteCurrentChapter()
            },
            onDismiss = {
                confirm_delete = false
            }
        )
        return
    }

    val promote_target = confirm_promote_target
    if (promote_target != null) {
        ConfirmDialog(
            title = "Set chapter $promote_target as current?",
            onConfirm = {
                confirm_promote_target = null
                onPromoteChapter(promote_target)
            },
            onDismiss = {
                confirm_promote_target = null
            }
        )
        return
    }

    ScalingLazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .background(Color.Black),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.spacedBy(6.dp)
    ) {
        item {
            Text(
                text = book_name,
                color = Color.LightGray,
                fontSize = 14.sp,
                modifier = Modifier.padding(bottom = 2.dp)
            )
        }

        if (chap_history.isEmpty()) {
            item {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp)
                        .combinedClickable(
                            onClick = { show_numpad = true }
                        ),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = "Tap to add chapter",
                        color = Color.White.copy(alpha = 0.7f),
                        fontSize = 16.sp,
                        fontFamily = FontFamily.Serif
                    )
                }
            }
        } else {
            itemsIndexed(chap_history) { index, chap_num ->
                val is_current = index == 0
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 4.dp)
                        .combinedClickable(
                            onClick = {
                                if (is_current) {
                                    show_numpad = true
                                }
                            },
                            onLongClick = {
                                if (is_current) {
                                    confirm_delete = true
                                } else {
                                    confirm_promote_target = chap_num
                                }
                            }
                        ),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = chap_num.toString(),
                        fontFamily = FontFamily.Serif,
                        fontSize = if (is_current) 38.sp else 22.sp,
                        fontWeight = if (is_current) FontWeight.Bold else FontWeight.Normal,
                        color = if (is_current) Color.White else Color.White.copy(alpha = 0.5f)
                    )
                }
            }
        }
    }
}
