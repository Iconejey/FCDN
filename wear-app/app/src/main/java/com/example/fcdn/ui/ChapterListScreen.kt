package com.example.fcdn.ui

import androidx.activity.compose.BackHandler
import androidx.compose.foundation.ExperimentalFoundationApi
import androidx.compose.foundation.background
import androidx.compose.foundation.combinedClickable
import androidx.compose.foundation.focusable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.draw.clip
import androidx.compose.ui.focus.FocusRequester
import androidx.compose.ui.focus.focusRequester
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.wear.compose.foundation.lazy.ScalingLazyColumn
import androidx.wear.compose.foundation.lazy.itemsIndexed
import androidx.wear.compose.foundation.lazy.rememberScalingLazyListState
import androidx.wear.compose.foundation.rotary.RotaryScrollableDefaults
import androidx.wear.compose.foundation.rotary.rotaryScrollable
import androidx.wear.compose.material3.*

@OptIn(ExperimentalFoundationApi::class)
@Composable
fun ChapterListScreen(
    book_name: String,
    chap_history: List<Int>,
    onBack: () -> Unit,
    onUpdateHistory: (List<Int>) -> Unit
) {
    BackHandler { onBack() }

    var show_numpad by remember { mutableStateOf(false) }
    var confirm_delete_current by remember { mutableStateOf(false) }
    var chapter_to_promote by remember { mutableStateOf<Int?>(null) }

    val list_state = rememberScalingLazyListState()
    val focus_requester = remember { FocusRequester() }

    LaunchedEffect(Unit) {
        focus_requester.requestFocus()
    }

    if (show_numpad) {
        NumpadDialog(
            title = "Nouveau chapitre",
            onConfirm = { val_int ->
                show_numpad = false
                val_int?.let { new_chap ->
                    val updated = listOf(new_chap) + chap_history
                    onUpdateHistory(updated)
                }
            },
            onDismiss = { show_numpad = false }
        )
    } else if (confirm_delete_current) {
        val curr = chap_history.firstOrNull() ?: 0
        ConfirmDialog(
            message = "Supprimer le chapitre $curr ?",
            onConfirm = {
                confirm_delete_current = false
                if (chap_history.isNotEmpty()) {
                    onUpdateHistory(chap_history.drop(1))
                }
            },
            onDismiss = { confirm_delete_current = false }
        )
    } else if (chapter_to_promote != null) {
        val chap = chapter_to_promote!!
        ConfirmDialog(
            message = "Définir le chapitre $chap comme actuel ?",
            onConfirm = {
                chapter_to_promote = null
                val filtered = chap_history.filter { it != chap }
                onUpdateHistory(listOf(chap) + filtered)
            },
            onDismiss = { chapter_to_promote = null }
        )
    } else {
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
                    text = book_name,
                    style = MaterialTheme.typography.titleMedium,
                    color = MaterialTheme.colorScheme.onBackground,
                    fontFamily = FontFamily.Serif,
                    modifier = Modifier.padding(bottom = 2.dp)
                )
            }

            if (chap_history.isEmpty()) {
                item {
                    Button(
                        onClick = { show_numpad = true },
                        modifier = Modifier.fillMaxWidth(0.85f)
                    ) {
                        Text(
                            text = "+ Ajouter un chapitre",
                            style = MaterialTheme.typography.labelMedium
                        )
                    }
                }
            } else {
                itemsIndexed(chap_history) { index, chap_num ->
                    val is_current = (index == 0)

                    if (is_current) {
                        Box(
                            modifier = Modifier
                                .fillMaxWidth(0.88f)
                                .clip(RoundedCornerShape(16.dp))
                                .background(MaterialTheme.colorScheme.surfaceContainer)
                                .combinedClickable(
                                    onClick = { show_numpad = true },
                                    onLongClick = { confirm_delete_current = true }
                                ),
                            contentAlignment = Alignment.Center
                        ) {
                            Column(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(vertical = 10.dp, horizontal = 12.dp),
                                horizontalAlignment = Alignment.CenterHorizontally
                            ) {
                                Text(
                                    text = "Chapitre actuel",
                                    style = MaterialTheme.typography.labelSmall,
                                    color = MaterialTheme.colorScheme.primary,
                                    fontFamily = FontFamily.Serif
                                )
                                Text(
                                    text = chap_num.toString(),
                                    fontSize = 32.sp,
                                    fontWeight = FontWeight.Bold,
                                    fontFamily = FontFamily.Serif,
                                    color = MaterialTheme.colorScheme.onSurface,
                                    textAlign = TextAlign.Center
                                )
                            }
                        }
                    } else {
                        Box(
                            modifier = Modifier
                                .fillMaxWidth(0.85f)
                                .alpha(0.5f)
                                .clip(RoundedCornerShape(12.dp))
                                .background(MaterialTheme.colorScheme.surfaceContainerLow)
                                .combinedClickable(
                                    onClick = { },
                                    onLongClick = { chapter_to_promote = chap_num }
                                ),
                            contentAlignment = Alignment.Center
                        ) {
                            Box(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(vertical = 8.dp),
                                contentAlignment = Alignment.Center
                            ) {
                                Text(
                                    text = chap_num.toString(),
                                    fontSize = 18.sp,
                                    fontFamily = FontFamily.Serif,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                                    textAlign = TextAlign.Center
                                )
                            }
                        }
                    }
                }

                item {
                    Spacer(modifier = Modifier.height(2.dp))
                }

                item {
                    CompactButton(
                        onClick = { show_numpad = true }
                    ) {
                        Text(
                            text = "+ Nouveau chapitre",
                            style = MaterialTheme.typography.labelSmall
                        )
                    }
                }
            }
        }
    }
}
