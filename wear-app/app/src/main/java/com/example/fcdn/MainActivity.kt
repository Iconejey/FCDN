package com.example.fcdn

import android.content.Context
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.BackHandler
import androidx.activity.compose.setContent
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.sp
import androidx.wear.compose.material.Text
import com.example.fcdn.data.ApiClient
import com.example.fcdn.ui.BookListScreen
import com.example.fcdn.ui.ChapterListScreen
import com.example.fcdn.ui.QrPairingScreen
import kotlinx.coroutines.launch
import org.json.JSONArray
import org.json.JSONObject

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        val prefs = getSharedPreferences("fcdn_prefs", Context.MODE_PRIVATE)

        setContent {
            var user_id by remember { mutableStateOf(prefs.getString("user_id", null)) }
            var user_data by remember { mutableStateOf<JSONObject?>(null) }
            var selected_book by remember { mutableStateOf<String?>(null) }
            var is_loading by remember { mutableStateOf(false) }
            val coroutine_scope = rememberCoroutineScope()

            fun saveUserId(new_id: String) {
                prefs.edit().putString("user_id", new_id).apply()
                user_id = new_id
            }

            fun clearUserId() {
                prefs.edit().remove("user_id").apply()
                user_id = null
                user_data = null
                selected_book = null
            }

            LaunchedEffect(user_id) {
                val current_id = user_id
                if (current_id != null) {
                    is_loading = true
                    val loaded = ApiClient.fetchUserData(current_id)
                    user_data = loaded ?: JSONObject()
                    is_loading = false
                }
            }

            val current_user_id = user_id
            if (current_user_id == null) {
                QrPairingScreen(
                    onPaired = { paired_id ->
                        saveUserId(paired_id)
                    }
                )
            } else if (is_loading && user_data == null) {
                Box(
                    modifier = Modifier.fillMaxSize().background(Color.Black),
                    contentAlignment = Alignment.Center
                ) {
                    Text("Loading...", color = Color.White, fontSize = 14.sp)
                }
            } else {
                val data_obj = user_data ?: JSONObject()
                val active_book = selected_book

                if (active_book == null) {
                    val book_keys = remember(data_obj) {
                        val keys = mutableListOf<String>()
                        val iterator = data_obj.keys()
                        while (iterator.hasNext()) {
                            keys.add(iterator.next())
                        }
                        if (keys.isEmpty()) listOf("FCDN", "CDSI") else keys
                    }

                    BookListScreen(
                        book_list = book_keys,
                        onSelectBook = { book ->
                            selected_book = book
                        },
                        onLogout = {
                            clearUserId()
                        }
                    )
                } else {
                    BackHandler {
                        selected_book = null
                    }

                    val book_data = data_obj.optJSONObject(active_book) ?: JSONObject()
                    val raw_chap_arr = book_data.optJSONArray("chap_history") ?: JSONArray()
                    val chap_history = remember(raw_chap_arr.toString()) {
                        val list = mutableListOf<Int>()
                        for (i in 0 until raw_chap_arr.length()) {
                            val val_num = raw_chap_arr.optInt(i, -1)
                            if (val_num >= 0) list.add(val_num)
                        }
                        list
                    }

                    fun updateChapHistory(new_list: List<Int>) {
                        val new_data_obj = JSONObject(data_obj.toString())
                        val new_book_obj = new_data_obj.optJSONObject(active_book) ?: JSONObject()
                        val new_arr = JSONArray()
                        for (item in new_list) {
                            new_arr.put(item)
                        }
                        new_book_obj.put("chap_history", new_arr)
                        new_data_obj.put(active_book, new_book_obj)
                        user_data = new_data_obj

                        coroutine_scope.launch {
                            ApiClient.saveUserData(current_user_id, new_data_obj)
                        }
                    }

                    ChapterListScreen(
                        book_name = active_book,
                        chap_history = chap_history,
                        onAddChapter = { new_chap ->
                            val updated = listOf(new_chap) + chap_history
                            updateChapHistory(updated)
                        },
                        onDeleteCurrentChapter = {
                            if (chap_history.isNotEmpty()) {
                                val updated = chap_history.drop(1)
                                updateChapHistory(updated)
                            }
                        },
                        onPromoteChapter = { target_chap ->
                            val filtered = chap_history.filter { it != target_chap }
                            val updated = listOf(target_chap) + filtered
                            updateChapHistory(updated)
                        }
                    )
                }
            }
        }
    }
}
